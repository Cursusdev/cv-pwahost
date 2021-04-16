# Local developement 
## start webpack 
$ yarn dev 
## Open url (auto): 
http://127.0.0.1:8080/ 

# Docker local 
## start app 
$ yarn start 
## Open url: 
// Wait for a short time  
http://127.0.0.1:8080/ 

OR 

## Build image 
$ docker build -f Dockerfile -t cv-pwahosthost . 
## Run container 
$ docker run --rm -d -p 8080:80/tcp cv-pwahost:latest 
## Open url: 
http://127.0.0.1:8080/ 
## Stop and remove container 
$ docker stop cv-pwahost 
$ docker rm cv-pwahost 
## Rebuild image 
$ docker build -t cv-pwahost . 
## Reset image 
$ docker rmi -f cv-pwahost 
## clean 
$ docker container rm -f $(docker ps --filter ancestor=cv-pwahost:latest -q)  
$ docker rmi cv-pwahost  

# Release or hotfix via GCP 
// required: 
  - make a trigger config dev branch for GCP 
  - use cloudbuild.yaml file with a commit repo Github 
## Cloud Run 
$ git add .  
$ git commit -m "first commit"  
$ git push -u origin master  

# Hosting to Firebase 
## Deloyement 
// The ./dist folder is ok.  
// $ firebase login:ci  
// $ firebase init  
$ yarn deploy  
