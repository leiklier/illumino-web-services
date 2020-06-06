# Illumino Web Services

This repository contains all web services required by Illumino. This includes APIs as well as websites. The softwares is organized around a stateless microservices architecture. Each microservice is deployed inside a Docker container, and the containers are orchestrated by Kubernetes.

**Author / Maintainer**: Leik Lima-Eriksen

## Endpoints


**Convention**:

* API services use ports 30 000 - 30 499 for exposing services and 30 500 - 30 999 for debuggers.
* Website services use ports 31 000 - 31 499 for exposing services and 31 500 - 31 999 for debuggers.


### [DEV]

|  Service name | Available at  |  TLS enabled? | Debugger port |
|---|---|---|---|
| frontend-api | [localhost:30000/graphql](localhost:30000/graphql) | No | 30500 |
| embedded-api | [localhost:30001](localhost:30001/embedded) | No | 30501 |
| web-app | [localhost:31000](localhost:31000) | No | N/A |

### [PROD] / [STAG]
|  Service name | Available at  |  TLS enabled? |
|---|---|---|
| frontend-api | [api.get-illumi.no/graphql](api.get-illumi.no/graphql) | Yes |
| embedded-api | [api.get-illumi.no/embedded](api.get-illumi.no/embedded) | Yes |
| web-app | [get-illumi.no](get-illumi.no) | Yes|

## Onboarding

The following **prerequisities** are required on your machine for development purposes:

- `docker-machine`, v19.3.x or newer
- `microk8s`

Please read the **Installation** sections for instructions on how to install these.

### Installation

First, install `microk8s`. This package is a distribution of Kubernetes which comes bundled with a couple of handy add-ons. It should be installed via snap:

```bash
$ sudo snap install microk8s --classic
```

In order to avoid having to type `sudo` each time, add your user to the `microk8s` group:

```bash
$ sudo usermod -a -G microk8s $USER
$ sudo chown -f -R $USER ~/.kube
$ su - $USER
```

Add the alias for `kubectl`:

```
$ echo "alias kubectl='microk8s kubectl'" >> ~/.bashrc
```

And lastly, install the required add-ons:
```bash
$ microk8s enable dns storage
$ microk8s enable ingress
$ microk8s enable registry
```

**NB**: You should wait a couple of minutes between typing each of the above commands in order for the installation to succeed.

It may happen that the firewall does not allow pod traffic. This may prevent the pods from sending outbound traffic to the Internet. To check this, run
```bash
$ microk8s inspect
```
It should give you the details on how to correctly configure the firewall if problems are detected.

The next step is to install `docker-ce` on your machine. This is required for building the Docker images. The configuration of Docker is pretty straight forward:

```bash
$ sudo apt update
$ sudo apt install apt-transport-https ca-certificates curl software-properties-common
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
$ sudo apt update
$ apt-cache policy docker-ce
$ sudo apt install docker-ce
$ sudo usermod -aG docker ${USER}
$ su - ${USER}
```

It is also highly recommended to have `stern` installed. This software makes it easy to output logs from pods. Installation instructions are not provided since it is not available from a package registry. However, it should be fairly easy to install.

**Congratulations, you have now successfully configured Kubernetes and Docker!**

### Deployment - [DEV]

**NB**: requires an initial build in order to work! Please read the **Build** section first.

To **deploy the cluster** on your machine for development purposes, simply run

```bash
$ kubectl apply -f cluster/dev
```

from the root of this repository. This will spin up all the microservices in a minute or two. No additional actions need to be done.

To **remove the cluster** from your machine, you should run

```bash
$ kubectl delete -f cluster/dev
```

from the root of this repository. This shuts down all the microservices. You may at any time spin it up again by typing the `apply` command as mentioned above.

### Deployment - [PROD] / [STAG]

Since we are using `https`, we also need to configure a CertManager in addition to the above mentioned requirements. This is responsible for retrieving SSL certificates by LetsEncrypt. CertManager is installed by issuinng the following commands:

```bash
$ kubectl create namespace cert-manager
$ kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.12.0/cert-manager.yaml
```

Proceed by starting the `ssl-certificate-issuer`s:
```bash
$ kubectl apply -f cluster/_ssl
```
(should be done from the root of this repository)

Build the images as described in the **Build** section. Then start the cluster by running

**[PROD]**:
```bash
$ kubectl apply -f cluster/prod
```

**[STAG]**:

```bash
$ kubectl apply -f cluster/stag
```

The cluster can be stopped by replacing `apply` with `delete` in the above commands.

## Build

The docker images are all built by issuing

```bash
$ ./docker-build.sh
```

from the root of this repository. This will create images for both production and development, and all the images are automatically pushed to the local registry available at `localhost:32000`

## Development workflow

When using the `dev` cluster, the source files are bind mounted inside their respective pods. Also, all pods are configured in such a way that they will restart when files are changing. Therefore, your development workflow should not differ much from what you are used to. Simply just save your source file, and the change is automatically applied!


Using docker does however come with a caveat; since compiled modules are OS dependent, you cannot simply run `yarn add` inside a directory, since this may result in an incompatibility issue if your OS != Linux. Instead, such a command should be run inside the `Pod`s. Retrieve the correct Pod name (`<POD_NAME>`) by running

```bash
$ kubectl get pods
```

An interactive shell can be created inside the Pod by running

```bash
$ kubectl exec -it <POD_NAME> -- /bin/bash
```

All dependency files inside the pods are bind mounted to the host OS, and so the changes will be noticed by git as well. However, you need to `./docker-build.sh` again if you restart the cluster.


**TLDR**:

- Hot reload in all microservices
- Install packages by running commands inside the `Pod`.
