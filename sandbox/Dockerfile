FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl nodejs npm \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    jupyter jupyterlab \
    pandas numpy scikit-learn matplotlib seaborn \
    transformers torch \
    openai anthropic \
    langchain langchain-community \
    networkx graphviz \
    pytest \
    && python -m ipykernel install --user --name=python3

# Network restrictions: no outbound except OpenRouter
RUN echo "http_proxy=" >> /etc/environment && \
    echo "https_proxy=" >> /etc/environment

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /sandbox
ENV HOME=/sandbox
SHELL ["/bin/bash", "-c"]

# Auto-terminate after 2 hours
CMD ["bash", "/entrypoint.sh"]
