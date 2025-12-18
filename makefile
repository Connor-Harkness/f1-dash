dev-dashboard:
	cd ./dash && yarn dev

dev-api:
	cd ./services/api && node src/index.js

dev-live:
	cd ./services/live && node src/index.js

dev-analytics:
	cd ./services/analytics && node src/index.js

dev-importer:
	cd ./services/importer && node src/index.js


run-dashboard:
	cd ./dash && yarn build && yarn start

run-api:
	cd ./services/api && node src/index.js

run-live:
	cd ./services/live && node src/index.js

run-analytics:
	cd ./services/analytics && node src/index.js

run-importer:
	cd ./services/importer && node src/index.js