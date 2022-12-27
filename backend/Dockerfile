FROM ubuntu:22.04

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y python3 python3-pip

RUN useradd -ms /bin/bash bracket
WORKDIR /home/bracket/backend

COPY . /home/bracket/backend
RUN chown -R bracket:bracket /home/bracket
USER bracket
ENV PATH="${PATH}:/home/bracket/.local/bin"

# Install backend
RUN python3 -m pip install --upgrade pipenv wheel virtualenv
RUN pipenv install -d
RUN pipenv run mypy .
