FROM grafana/logcli:2.9.6-amd64 as logcli

FROM mcr.microsoft.com/devcontainers/typescript-node:20-bookworm

COPY --from=logcli /usr/bin/logcli /usr/bin/logcli

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    redis-tools \
    iputils-ping \
    telnet \
    jq \
    tmux

RUN npm install -g npm@latest && npm uninstall -g npm@9.8.1
