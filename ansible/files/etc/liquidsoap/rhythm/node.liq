def autodj() =
    uri = list.hd(default="", process.read.lines('sudo -u nginx /usr/bin/node /var/www/api.rhythm.place/src/console.js', timeout=10.))
    request.create(uri)
end

node = request.dynamic(autodj)