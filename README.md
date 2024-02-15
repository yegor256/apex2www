[![docker](https://github.com/yegor256/apex2www/actions/workflows/docker.yml/badge.svg)](https://github.com/yegor256/apex2www/actions/workflows/docker.yml)
[![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/yegor256/apex2www)](https://hub.docker.com/r/yegor256/apex2www)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/yegor256/total/apex2www/master/LICENSE.txt)

[This](https://hub.docker.com/r/yegor256/apex2www) [Docker](https://www.docker.com/)
image helps you start your own apex/root to www redirecting HTTP server.

When Docker is [installed](https://docs.docker.com/install/), run this:

```bash
$ docker run --name apex2www --detach \
  --restart=always --publish 80:80 \
  yegor256/apex2www
```

Now you can point `A` DNS record of your domain to the IP address of the
server where the Docker container is running. Once an HTTP request arrives,
it will automatically be redirected to the `www.` hostname.
