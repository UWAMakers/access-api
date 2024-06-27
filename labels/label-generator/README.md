```
docker run --rm -it  -p 3000:3000/tcp --add-host=host.docker.internal:host-gateway -e API_URL=http://host.docker.internal:3030 access-label-gen:latest
```