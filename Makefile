lib/etleneum.cjs.js lib/etleneum.esm.js: $(shell ls *.js)
	mkdir -p lib
	./node_modules/.bin/rollup -c rollup.config.js
