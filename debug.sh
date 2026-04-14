#!/bin/bash
sudo docker run --rm -v /home/PT/backend:/app tsea-x-backend bash -c 'ls -l && python -c "import main; print(\"Import Success\")"' > debug.log 2>&1
cat debug.log
