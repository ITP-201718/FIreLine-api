.PHONY: start start-d

start-d:
	docker run -d -v ${PWD}:/node --name node-api --rm -it fireline/node-api

start:
	docker run -v ${PWD}:/node --name node-api-run --rm -it fireline/node-api
