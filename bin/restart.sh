for i in public-web dispatcher ping-listener
do
	docker restart $i
done
