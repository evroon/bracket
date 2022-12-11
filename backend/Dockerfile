FROM ubuntu:22.04

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y python3 python3-pip

RUN useradd -ms /bin/bash ladderz
WORKDIR /home/ladderz/backend

COPY . /home/ladderz/backend
RUN chown -R ladderz:ladderz /home/ladderz
USER ladderz
ENV PATH="${PATH}:/home/ladderz/.local/bin"

# Install backend
RUN python3 -m pip install --upgrade pipenv wheel virtualenv
RUN pipenv install -d
RUN pipenv run mypy .
