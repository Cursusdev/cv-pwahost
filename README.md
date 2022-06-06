# Local developement
## start webpack
```bash
$ yarn dev
```
### Open url (auto): http://127.0.0.1:8080/

# Docker local
## start app
```bash
$ yarn start
```
### Open url: http://127.0.0.1:8080/

OR

## Build image
```bash
$ docker build -f Dockerfile -t cv-pwahosthost .
```
## Run container
```bash
$ docker run --rm -d -p 8080:80/tcp cv-pwahost:latest
```
### Open url: http://127.0.0.1:8080/
## Stop and remove container
```bash
$ docker stop cv-pwahost  
$ docker rm cv-pwahost  
```
## Rebuild image
```bash
$ docker build -t cv-pwahost .
```
## Reset image
```bash
$ docker rmi -f cv-pwahost
```
## clean
```bash
$ docker container rm -f $(docker ps --filter ancestor=cv-pwahost:latest -q)
$ docker rmi cv-pwahost
```
# Release or hotfix via GCP
required:
  - make a trigger config dev branch for GCP 
  - use cloudbuild.yaml file with a commit repo Github 
## Cloud Run
```bash
$ git add .
$ git commit -m "first commit"
$ git push -u origin master
```
# Hosting to Firebase
## Deloyement
The ./dist folder is ok.
```bash
$ firebase login:ci
$ firebase init
$ yarn deploy
```