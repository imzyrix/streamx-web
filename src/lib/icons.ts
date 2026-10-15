// StreamX icon set — Solar Icon Set by 480 Design (https://github.com/480-Design/Solar-Icon-Set),
// licensed CC BY 4.0 (see NOTICE). Icons are vendored as SVG files under icons/solar/ and imported
// here as raw markup so they inherit the current text colour.
//
// Styles are mixed deliberately, but every glyph is heavy (no thin/linear strokes):
//   • Bold Duotone — navigation chrome, primary actions, score + status marks (weight + depth)
//   • Bold         — metadata, links and inline controls (solid, unambiguous)

import addCircle from "../../icons/solar/bold-duotone/add-circle.svg?raw";
import bookmark from "../../icons/solar/bold-duotone/bookmark.svg?raw";
import checkCircle from "../../icons/solar/bold-duotone/check-circle.svg?raw";
import clapperboard from "../../icons/solar/bold-duotone/clapperboard.svg?raw";
import clockCircle from "../../icons/solar/bold-duotone/clock-circle.svg?raw";
import dangerCircle from "../../icons/solar/bold-duotone/danger-circle.svg?raw";
import flame from "../../icons/solar/bold-duotone/flame.svg?raw";
import graph from "../../icons/solar/bold-duotone/graph.svg?raw";
import heart from "../../icons/solar/bold-duotone/heart.svg?raw";
import homeSmile from "../../icons/solar/bold-duotone/home-smile.svg?raw";
import infoCircle from "../../icons/solar/bold-duotone/info-circle.svg?raw";
import magnifer from "../../icons/solar/bold-duotone/magnifer.svg?raw";
import play from "../../icons/solar/bold-duotone/play.svg?raw";
import star from "../../icons/solar/bold-duotone/star.svg?raw";
import tv from "../../icons/solar/bold-duotone/tv.svg?raw";
import verifiedCheck from "../../icons/solar/bold-duotone/verified-check.svg?raw";

import altArrowLeft from "../../icons/solar/bold/alt-arrow-left.svg?raw";
import altArrowRight from "../../icons/solar/bold/alt-arrow-right.svg?raw";
import arrowRightUp from "../../icons/solar/bold/arrow-right-up.svg?raw";
import boldCalendar from "../../icons/solar/bold/calendar.svg?raw";
import boldCloseCircle from "../../icons/solar/bold/close-circle.svg?raw";
import compass from "../../icons/solar/bold/compass.svg?raw";
import boldDownload from "../../icons/solar/bold/download.svg?raw";
import eye from "../../icons/solar/bold/eye.svg?raw";
import filter from "../../icons/solar/bold/filter.svg?raw";
import global from "../../icons/solar/bold/global.svg?raw";
import magicStick from "../../icons/solar/bold/magic-stick.svg?raw";
import medalStar from "../../icons/solar/bold/medal-star.svg?raw";
import pause from "../../icons/solar/bold/pause.svg?raw";
import playCircle from "../../icons/solar/bold/play-circle.svg?raw";
import share from "../../icons/solar/bold/share.svg?raw";
import boldStar from "../../icons/solar/bold/star.svg?raw";
import ticket from "../../icons/solar/bold/ticket.svg?raw";
import user from "../../icons/solar/bold/user.svg?raw";
import usersGroup from "../../icons/solar/bold/users-group-rounded.svg?raw";
import volumeLoud from "../../icons/solar/bold/volume-loud.svg?raw";

function prepare(raw: string): string {
  return raw
    .replace(/<svg\b[^>]*>/, (tag) =>
      tag
        .replace(/\s(?:width|height)="[^"]*"/g, "")
        .replace("<svg", '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" focusable="false"'),
    )
    .replace(/(fill|stroke)="(?!none\b)[^"]*"/g, '$1="currentColor"');
}

export const ICONS = {
  home: prepare(homeSmile),
  movies: prepare(clapperboard),
  series: prepare(tv),
  search: prepare(magnifer),
  play: prepare(play),
  playCircle: prepare(playCircle),
  pause: prepare(pause),
  star: prepare(star),
  starSolid: prepare(boldStar),
  info: prepare(infoCircle),
  add: prepare(addCircle),
  check: prepare(checkCircle),
  bookmark: prepare(bookmark),
  heart: prepare(heart),
  flame: prepare(flame),
  verified: prepare(verifiedCheck),
  graph: prepare(graph),
  clock: prepare(clockCircle),
  calendar: prepare(boldCalendar),
  back: prepare(altArrowLeft),
  forward: prepare(altArrowRight),
  external: prepare(arrowRightUp),
  close: prepare(boldCloseCircle),
  user: prepare(user),
  users: prepare(usersGroup),
  globe: prepare(global),
  share: prepare(share),
  download: prepare(boldDownload),
  filter: prepare(filter),
  eye: prepare(eye),
  volume: prepare(volumeLoud),
  danger: prepare(dangerCircle),
  medal: prepare(medalStar),
  ticket: prepare(ticket),
  compass: prepare(compass),
  magic: prepare(magicStick),
} as const;

export type IconName = keyof typeof ICONS;
