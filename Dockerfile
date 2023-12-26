# syntax=docker/dockerfile

FROM unit:python3.11
COPY ./build_config/* /docker-entrypoint.d/
COPY ./api/ /app/api/
COPY ./lia/ /app/ui/

EXPOSE 80

RUN target=/root/.cache/pip \ 
    python -m pip install --upgrade --no-cache-dir -r /app/api/requirements.txt