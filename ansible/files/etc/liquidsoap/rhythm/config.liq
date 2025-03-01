# Logs
settings.server.log.level.set(3)
# log.file.path.set("/dev/null")
log.file.path.set("/var/log/liquidsoap/liquidsoap.log")
log.stdout.set(true)

# PID
settings.init.daemon.pidfile.path.set("/run/liquidsoap-rhythm.pid")

settings.server.telnet.set(true)
settings.harbor.bind_addrs.set(["0.0.0.0"])

# tweak these values if you have lag, skipping, buffer underrun etc
settings.frame.duration.set(0.04)
settings.root.max_latency.set(30.)

set("request.grace_time", 3.0)