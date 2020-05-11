# APIS

# - FRONTEND


# -- DEV
docker image build -t localhost:32000/illumino-frontend-api--dev:latest --target=dev ./apis/frontend
docker push localhost:32000/illumino-frontend-api--dev:latest

# -- STAG
docker image build -t localhost:32000/illumino-frontend-api--stag:latest --target=stag ./apis/frontend
docker push localhost:32000/illumino-frontend-api--stag:latest

# -- PROD
docker image build -t localhost:32000/illumino-frontend-api:latest --target=prod ./apis/frontend
docker push localhost:32000/illumino-frontend-api:latest


# WEBSITES

# - APP

# -- DEV
docker image build -t localhost:32000/illumino-web-app--dev:latest --target=dev ./websites/app
docker push localhost:32000/illumino-web-app--dev:latest

# -- STAG
docker image build -t localhost:32000/illumino-web-app--stag:latest --target=stag ./websites/app
docker push localhost:32000/illumino-web-app--stag:latest

# -- PROD
docker image build -t localhost:32000/illumino-web-app:latest --target=prod ./websites/app
docker push localhost:32000/illumino-web-app:latest

