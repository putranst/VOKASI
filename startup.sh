#! /bin/bash
apt-get update
apt-get install -y docker.io docker-compose
gcloud auth configure-docker -q
