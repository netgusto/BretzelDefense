SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)

lib: $(LIB)
lib/%.js: src/%.js
	mkdir -p $(@D)
	node ./node_modules/babel-cli/bin/babel.js $< -o $@

clean:
	rm -Rf lib
