# The MIT License (MIT)
#
# Copyright (c) 2024 Yegor Bugayenko
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

FROM ubuntu:22.04
MAINTAINER Yegor Bugayenko <yegor256@gmail.com>
LABEL Description="Apex/root DNS redirector" Vendor="Yegor Bugayenko" Version="0.1"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y
RUN apt-get install -y curl
RUN rm -rf /usr/lib/node_modules \
  && curl -sL https://deb.nodesource.com/setup_18.x -o /tmp/nodesource_setup.sh \
  && bash /tmp/nodesource_setup.sh \
  && apt-get -y install nodejs \
  && bash -c 'node --version' \
  && bash -c 'npm --version'

COPY . /apex2www
RUN cd /apex2www && npm install
RUN cd /apex2www && src/apex2www.js --port 80 &
RUN cd /apex2www && src/apex2www.js --https --port 443 &

EXPOSE 80/tcp
EXPOSE 443/tcp

# This means, sleep forever:
ENTRYPOINT ["sh", "-c", "tail -f /dev/null"]
