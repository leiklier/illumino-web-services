# Illumino Web Services

This repository contains all web services required by Illumino. This includes APIs as well as websites. The softwares is organized around a microservices architecture. Each microservice is deployed inside a Docker container, and the containers are orchestrated by Kubernetes.

## Onboarding

The following **prerequisities** are required on your machine for development purposes:

- `docker-machine`, v19.3.x or newer
- `microk8s`

Please read the **Installation** sections for instructions on how to install these.

**NB**: The cluster is exposed on PORT 80, so please make sure that this port is available on the host machine.

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

Since we are using `https`, we also need to configure a CertManager. This is responsible for retrieving SSL certificates by LetsEncrypt. CertManager is installed by issuinng the following commands:

```bash
$ kubectl create namespace cert-manager
$ kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.12.0/cert-manager.yaml
```

Proceed by starting the `ssl-certificate-issuer`s:
```bash
$ kubectl apply -f cluster/_ssl
```
(should be done from the root of this repository)

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

### Deployment

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

## Build

The docker images are all built by issuing

```bash
$ ./docker-build.sh
```

from the root of this repository. This will create images for both production and development, and all the images are automatically pushed to the local registry available at `localhost:32000`

## Development workflow

When using the `dev` cluster, the source files are bind mounted inside their respective pods. Also, all pods are configured in such a way that they will restart when files are changing. Therefore, your development workflow should not differ much from what you are used to. Simply just save your source file, and the change is automatically applied!


Using docker does however come with a caveat; since compiled modules are OS dependent, you cannot simply run `yarn add` inside a directory, since this may result in an incompatibility issue if your OS != Linux. Instead, such a command should be run inside a Kubernetes `Job`.

**TLDR**:

- Hot reload in all microservices
- Use proprietary CLI for installing packages
