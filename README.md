# Bid List Server

[View API Documentation](https://documenter.getpostman.com/view/17455584/2s93XzyNy4)

When exposing the app to the internet via port-forward, add this to enable https.
```
    public function boot(): void
    {
        $this->app['request']->server->set('HTTPS','on');
    }
```