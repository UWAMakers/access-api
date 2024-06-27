```
docker run --rm -it --add-host=host.docker.internal:host-gateway -e API_URL=http://host.docker.internal:3030 -e LABEL_GEN_URL=http://host.docker.internal:3000/label-gen -e PRINTER_ID=61f9417460693609c8bdd48d -e PRINTER_SECRET=secret --device=/dev/usb/lp0 access-label-client:latest
```

https://github.com/pklaus/brother_ql/issues/50#issuecomment-664457486