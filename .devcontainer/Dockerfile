FROM mcr.microsoft.com/devcontainers/typescript-node:20-bookworm

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends redis-tools iputils-ping dnsutils telnet jq nmap

RUN npm install -g npm@latest && npm uninstall -g npm@9.8.1
