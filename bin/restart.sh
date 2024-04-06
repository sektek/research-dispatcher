npm run build:lib
for i in public-web dispatcher ping-listener
do
	docker restart $i
done
