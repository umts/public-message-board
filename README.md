# Public Message Board

An embeddable SPA that displays live public message information for a transit organization using
[Avail Technologies'][avail] operations software.

## Usage

This application is meant to be embedded statically within websites using `<iframe>`s, and configurable
through url search parameters.

### Configuration

Configuration options are passed using url search parameters (query strings) as outlined below.

- Required
  - `?gtfsScheduleUrl=https://example.com/gtfs/schedule` will fetch GTFS Schedule data from the specified URL.
  - `?gtfsRealtimeAlertsUrl=https://example.com/gtfs/alerts/v2` will fetch GTFS Realtime data from the specified URL.
- Optional
  - `?routes=A1,B2,C3` will provide a list of routes that you want to display messages for. By default, all messages
    will be displayed. General messages will always be shown.

A fully configured embedding to show messages for the UMass campus shuttle will look like:

```html
<iframe src="https://example.com/?gtfsScheduleUrl=https://example.com/gtfs/schedule&gtfsRealtimeAlertsUrl=https://example.com/gtfs/alerts/v2&routes=34,35"
        style="display: block; width: 100%; border: none;"
        onload="window.addEventListener('message', (e) => { if (new window.URL(e.origin).origin === new window.URL(this.src).origin) { this.height = e.data.height; } });">
</iframe>
```

The GTFS endpoints must obey the [GTFS Standard][gtfs-standard], otherwise the board will fail to display any information.

## Development

This application uses [`react`][react] as a framework and is bundled using [`vite`][vite]
through [`node.js`][nodejs] + [`npm`][npm]. It is recommended that you use
[`nodenv`][nodenv] to manage local node installations.

It is entirely clientside and data is fetched remotely from an Avail [InfoPoint API][infopoint] instance.

### Requirements

- `node.js`/`npm` matching the version in the `.node-version` file (just run `nodenv install` if using nodenv)

### Setup

```sh
npm install # bundle dependencies
```

### Scripts

```sh
npm run build    # builds a production bundle.
npm run dev      # starts a local development server.
npm run lint     # runs the js linter.
npm run lint:css # runs the css linter.
npm run preview  # serves a previously built production bundle.
```

## Contributing

Bug reports and pull requests are welcome on [GitHub][github].

## License

The application is available as open source under the terms of the [MIT License](license).

[avail]: https://www.availtec.com/
[github]: https://github.com/umts/avail-message-board
[gtfs-standard]: https://gtfs.org/documentation/overview
[license]: https://opensource.org/licenses/MIT
[nodejs]: https://nodejs.org
[nodenv]: https://github.com/nodenv/nodenv
[npm]: https://www.npmjs.com
[pvta]: https://pvta.com
[pvta-avail]: https://bustracker.pvta.com
[react]: https://react.dev
[vite]: https://vitejs.dev
