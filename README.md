# Illumino Web Services

This repository contains all web services required by Illumino. This includes APIs as well as websites. The softwares is organized around a microservices architecture. Each microservice is a Docker container, and the containers are orchestrated by Kubernetes.

## Onboarding

The following **prerequisities** are required on your machine:

- `docker-machine`, v19.3.x or newer
- Kubernetes, v1.14.x or newer
- `helm`, v3.0.x or newer

If you are using Docker Desktop, this bundles both `docker-machine` and Kubernetes.

**NB**: The cluster is exposed on PORT 80, so please make sure that this port is available on the host machine.

Since you are deploying the cluster on bare metal (no cloud provider), an `IngressController` is necessary for using URLs to route services. A sufficiently good controller can most easily be configured using `helm`:

```
$ helm repo add stable https://kubernetes-charts.storage.googleapis.com/
$ helm install illumino-ic stable/traefik --namespace kube-system
```

To **deploy the cluster** on your machine for development purposes, simply run

```bash
$ kubectl apply -f cluster/dev
```

from the root of this repository.

To **remove the cluster** from your machine, you should run

```bash
$ kubectl delete -f cluster/dev
```

from the root of this repository.

## Directory structure

```
.
├── apis
│   ├── auth
│   ├── embedded
│   ├── frontend
│   ├── lib
│   └── ota
├── websites
│   ├── admin
│   └── app
├── cluster
│   ├── dev
│   └── prod
└── db

```

## Endpoints

In **dev**: `<BASE-URL> = localhost`

In **prod**: `<BASE-URL> = get-illumi.no`

## How to develop

When using the `dev` cluster, the source files are bind mounted inside their respective pods. Also, all pods are configured in such a way that they will restart when files are changing. Therefore, your development workflow should not differ much from what you are used to.

Using docker does however come with a caveat; since compiled modules are OS dependent, you cannot simply run `yarn add` inside a directory, since this may result in an incompatibility issue if your OS != Linux. Instead, such a command should be run inside a Kubernetes `Job`.

**TLDR**:

- Hot reload in all microservices
- Use proprietary CLI for installing packages
