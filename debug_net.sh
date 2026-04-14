#!/bin/bash
sudo docker run --rm --network pt_default tsea-x-backend python -c "import socket; print(socket.gethostbyname('cloud-sql-proxy'))"
