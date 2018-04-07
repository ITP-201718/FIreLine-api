.PHONY: start start_armhf start_aarch64 start-d

start-d:
    docker run --user 1000 -d -v ${PWD}:/node -p 8080:8080 --name crossbar --rm -it crossbario/crossbar

start:
	docker run --user 1000 -v ${PWD}:/node -p 8080:8080 --name crossbar --rm -it crossbario/crossbar

start_armhf:
	docker run --user 1000 -v ${PWD}:/node -p 8080:8080 --name crossbar --rm -it crossbario/crossbar-armhf

start_aarch64:
	docker run --user 1000 -v ${PWD}:/node -p 8080:8080 --name crossbar --rm -it crossbario/crossbar-aarch64
