# Bid List Server

[View API Documentation](https://documenter.getpostman.com/view/17455584/2s93XzyNy4)

### Ecposing the Web Application using Port Forward
* To expose the Web Application via Port Forward add this to AppServiceProvider.php
```
    public function boot(): void
    {
        $this->app['request']->server->set('HTTPS','on');
    }
```
* Then delete the public/hot file
