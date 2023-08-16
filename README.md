# Public Message Board

An embeddable SPA that displays live public message information for a transit organization using
[Avail Technologies'][avail] operations software.

## Usage

This application is meant to be embedded statically within websites using `<iframe>`s, and configurable
through url search parameters.

### Embedding

```html
<iframe src="PRODUCTION_URL"
        style="display: block;
               width: 100%;
               border: none;">
</iframe>
```

### Configuration

Configuration options are passed using url search parameters (query strings) as outlined below.

- `?infoPoint=https://your-avail-instance/InfoPoint/rest/` will change the avail instance that the application retrieves
  data from (defaults to the [PVTA][pvta]'s [instance][pvta-avail]).
- `?routes=A1,B2,C3` will provide a list of routes that you want to display messages for (will show all messages by
  default, and general messages will always be displayed).

A fully configured embedding to show messages for the UMass campus shuttle will look like:

```html
<iframe src="PRODUCTION_URL/?infoPoint=https://bustracker.pvta.com/InfoPoint/rest&routes=34,35"
        style="display: block;
               width: 100%;
               border: none;">
</iframe>
```

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
[infopoint]: https://bustracker.pvta.com/InfoPoint/swagger
[license]: https://opensource.org/licenses/MIT
[nodejs]: https://nodejs.org
[nodenv]: https://github.com/nodenv/nodenv
[npm]: https://www.npmjs.com
[pvta]: https://pvta.com
[pvta-avail]: https://bustracker.pvta.com
[react]: https://react.dev
[vite]: https://vitejs.dev
