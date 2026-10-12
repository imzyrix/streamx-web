// StreamX web front end — icon set.
// Source: Solar Icon Set by 480 Design (https://github.com/480-Design/Solar-Icon-Set),
// licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
// The SVGs are vendored verbatim under icons/solar/<style>/ and rendered with
// CSS mask-image, so each icon inherits the current text colour. See NOTICE.

export const icon = (name, extra = "") =>
  `<span class="ico ico-${name}${extra ? " " + extra : ""}" aria-hidden="true"></span>`;

export const STAR = icon("star");
export const PLAY = icon("play");
export const INFO = icon("info-circle");
export const BACK = icon("alt-arrow-left");
export const CHEVRON = icon("alt-arrow-right");
export const SEARCH = icon("magnifer");
export const HOME = icon("home-smile");
export const FILM = icon("clapperboard");
export const TV = icon("tv");
export const CLOCK = icon("clock-circle");
export const CALENDAR = icon("calendar");
export const EXTERNAL = icon("arrow-right-up");
export const CLOSE = icon("close-circle");
export const PLUS = icon("add-circle");
export const CHECK = icon("check-circle");
export const USER = icon("user");
export const USERS = icon("users-group-rounded");
