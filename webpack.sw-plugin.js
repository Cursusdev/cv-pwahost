import crypto from 'crypto';
import webpack from 'webpack';

/**
 * ServiceWorkerBuildPlugin — renseigne sw.js a partir du build reel.
 *
 * POURQUOI CE PLUGIN EXISTE
 * sw.js etait un fichier statique, copie tel quel : son nom de cache ('cache-v2')
 * et sa liste de precache etaient ecrits a la main. Consequences constatees le
 * 12/08/2026 : le fichier n'avait pas change depuis 2024, donc le navigateur ne
 * detectait jamais de nouvelle version et ne mettait jamais le cache a jour ; et
 * la liste citait 3 fichiers disparus (noms a contenthash d'un build de 2024).
 *
 * CE QU'IL GARANTIT
 *  - __BUILD_ID__ est derive du CONTENU du build : il change si, et seulement si,
 *    un fichier emis change. Le nom du cache change donc tout seul a chaque
 *    livraison reelle, et ne bouge pas pour une recompilation identique.
 *  - __PRECACHE__ est genere depuis les assets REELLEMENT emis par cette
 *    compilation — pas depuis le disque, qui conserve les artefacts des builds
 *    precedents. Un fichier fantome y est donc impossible par construction.
 *
 * SI CE PLUGIN DISPARAIT : sw.js part en production avec les chaines
 * __BUILD_ID__ et __PRECACHE__ non remplacees. Le service worker leve alors une
 * erreur de syntaxe et ne s'installe pas — le site reste consultable en ligne,
 * mais perd le hors-ligne ET l'installation PWA. Panne visible, pas silencieuse :
 * c'est voulu, une garde muette se laisse desarmer sans que personne le sache.
 */

const NOM = 'ServiceWorkerBuildPlugin';

// Ce qui n'a rien a faire dans le precache :
//  - les source maps (poids inutile pour un visiteur)
//  - sw.js lui-meme (se mettre en cache fige sa propre mise a jour)
//  - img/ : 3,4 Mo de photos, chargees a la demande par les pages
const EXCLUS = [/\.map$/, /^sw\.js$/, /^img\//];

// Seule image appartenant a la coquille : le fond de page (css/style.css:105),
// visible immediatement et donc necessaire hors-ligne. Ajoutee explicitement
// parce que la regle ci-dessus ecarte tout img/.
const IMAGES_COQUILLE = ['img/palmier-mer_800w600h.webp'];

export class ServiceWorkerBuildPlugin {
  constructor({ fichier = 'sw.js' } = {}) {
    this.fichier = fichier;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(NOM, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: NOM,
          // SUMMARIZE : apres CopyWebpackPlugin, donc sw.js est deja emis.
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          const source = compilation.getAsset(this.fichier);
          if (!source) {
            compilation.errors.push(
              new Error(`${NOM} : ${this.fichier} absent des assets emis — le service worker ne sera pas renseigne.`)
            );
            return;
          }

          const emis = compilation.getAssets().map((a) => a.name).sort();

          // BUILD_ID : empreinte du build. Les noms portent deja un contenthash,
          // donc leur liste suffit a distinguer deux builds differents.
          const buildId = crypto.createHash('sha1').update(emis.join('\n')).digest('hex').slice(0, 12);

          const precache = emis
            .filter((n) => !EXCLUS.some((re) => re.test(n)) || IMAGES_COQUILLE.includes(n))
            .map((n) => `/${n}`);
          // '/' n'est pas un asset : c'est l'URL de index.html, elle doit y figurer.
          precache.unshift('/');

          let code = source.source.source().toString();
          const attendus = ['__BUILD_ID__', '__PRECACHE__'];
          const manquants = attendus.filter((j) => !code.includes(j));
          if (manquants.length) {
            compilation.errors.push(
              new Error(`${NOM} : jeton(s) ${manquants.join(', ')} introuvable(s) dans ${this.fichier}.`)
            );
            return;
          }

          code = code
            .replace('__BUILD_ID__', buildId)
            .replace('__PRECACHE__', JSON.stringify(precache, null, 2));

          compilation.updateAsset(this.fichier, new webpack.sources.RawSource(code));

          compilation.getLogger(NOM).info(
            `cache-${buildId} — ${precache.length} entrees de precache generees depuis ${emis.length} assets emis`
          );
        }
      );
    });
  }
}
