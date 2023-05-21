FROM nginx
COPY . /usr/share/nginx/html

# build
# docker build -t portfolio .

# run
# docker run -it -d -p 3001:80 portfolio