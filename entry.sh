#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2024 Yegor Bugayenko
# SPDX-License-Identifier: MIT

set -e

cd "$(dirname "$0")"

src/apex2www.js --port 80 &

src/apex2www.js --https --port 443 &

tail -f /dev/null
