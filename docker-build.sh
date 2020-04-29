# APIS

# - FRONTEND

# -- PROD
docker image build -t localhost:32000/illumino-frontend-api:latest --target=prod ./apis/frontend
docker push localhost:32000/illumino-frontend-api:latest

# -- DEV
docker image build -t localhost:32000/illumino-frontend-api--dev:latest --target=dev ./apis/frontend
docker push localhost:32000/illumino-frontend-api--dev:latest

# WEBSITES

# - APP

# -- PROD
docker image build -t localhost:32000/illumino-web-app:latest --target=prod ./websites/app
docker push localhost:32000/illumino-web-app:latest


# -- DEV
docker image build -t localhost:32000/illumino-web-app--dev:latest --target=dev ./websites/app
docker push localhost:32000/illumino-web-app--dev:latest