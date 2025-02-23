# SPDX-FileCopyrightText: Copyright (c) 2024 Yegor Bugayenko
# SPDX-License-Identifier: MIT

FROM ubuntu:24.04
MAINTAINER Yegor Bugayenko <yegor256@gmail.com>
LABEL Description="Apex/root DNS redirector" Vendor="Yegor Bugayenko" Version="0.1"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y
RUN apt-get install -y curl
RUN rm -rf /usr/lib/node_modules \
  && curl -sL https://deb.nodesource.com/setup_18.x -o /tmp/nodesource_setup.sh \
  && bash /tmp/nodesource_setup.sh \
  && apt-get -y install nodejs

COPY . /apex2www
RUN cd /apex2www && npm install

EXPOSE 80/tcp
EXPOSE 443/tcp

# This means, sleep forever:
ENTRYPOINT ["/apex2www/entry.sh"]
