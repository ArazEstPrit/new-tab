# New-Tab

This is a Chrome extension that replaces the default new tab page. The extension also includes a matching Chrome theme

## Installation

- Clone the repository.
- Run `npm i` to install the dependencies
- Open Chrome and go to `chrome://extensions/`.
- Toggle "Developer mode" on the top right corner.
- Click on "Load unpacked" and select the directory where you cloned the repository.
- (Optional) Click on "Load unpacked" and select the `theme` folder

## Development

The app uses sass and typescript to render the page. Run `npm run build` to compile the typescript and scss. You can run `npm run build:watch` to continuously compile as you make changes.
