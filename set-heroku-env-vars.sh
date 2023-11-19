while read -r line; do
	heroku config: set$line
done < default.env
