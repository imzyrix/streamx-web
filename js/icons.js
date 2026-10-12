// StreamX web front end — icon set.
// Source: Solar Icon Set by 480 Design (https://github.com/480-Design/Solar-Icon-Set),
// licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
// Modified: a subset of the Linear + Bold styles is inlined and recoloured to
// currentColor. Regenerate from the upstream pack; do not hand-edit. See NOTICE.

const wrap = (inner) => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${inner}</svg>`;

// Solar Bold — Like/Star
export const STAR = wrap(`<path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" fill="currentColor"/>`);

// Solar Bold — Video, Audio, Sound/Play
export const PLAY = wrap(`<path d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z" fill="currentColor"/>`);

// Solar Linear — Essentional, UI/Info Circle
export const INFO = wrap(`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/> <path d="M12 17V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <circle r="1" transform="matrix(1 0 0 -1 12 8)" fill="currentColor"/>`);

// Solar Linear — Arrows/Alt Arrow Left
export const BACK = wrap(`<path d="M15 5L9 12L15 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);

// Solar Linear — Arrows/Alt Arrow Right
export const CHEVRON = wrap(`<path d="M9 5L15 12L9 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);

// Solar Linear — Search/Magnifer
export const SEARCH = wrap(`<circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" stroke-width="1.5"/> <path d="M18.5 18.5L22 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`);

// Solar Linear — Essentional, UI/Home Smile
export const HOME = wrap(`<path d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`);

// Solar Linear — Video, Audio, Sound/Clapperboard
export const FILM = wrap(`<path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentColor" stroke-width="1.5"/> <path d="M21.5 8H2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <path d="M10.5 2.5L7 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <path d="M17 2.5L13.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`);

// Solar Linear — Electronic, Devices/TV
export const TV = wrap(`<path d="M22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22L8 22C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16L2 12C2 9.17157 2 7.75736 2.87868 6.87868C3.75736 6 5.17157 6 8 6L16 6C18.8284 6 20.2426 6 21.1213 6.87868C22 7.75736 22 9.17157 22 12V16Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 2L12 5.5L15 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <path d="M16 6V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <path d="M20 16C20 15.4477 19.5523 15 19 15C18.4477 15 18 15.4477 18 16C18 16.5523 18.4477 17 19 17C19.5523 17 20 16.5523 20 16Z" fill="currentColor"/> <path d="M20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13C19.5523 13 20 12.5523 20 12Z" fill="currentColor"/>`);

// Solar Linear — Time/Clock Circle
export const CLOCK = wrap(`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/> <path d="M12 8V12L14.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);

// Solar Linear — Time/Calendar
export const CALENDAR = wrap(`<path d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12Z" stroke="currentColor" stroke-width="1.5"/> <path d="M7 4V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <path d="M17 4V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <path d="M2.5 9H21.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <path d="M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16C17.5523 16 18 16.4477 18 17Z" fill="currentColor"/> <path d="M18 13C18 13.5523 17.5523 14 17 14C16.4477 14 16 13.5523 16 13C16 12.4477 16.4477 12 17 12C17.5523 12 18 12.4477 18 13Z" fill="currentColor"/> <path d="M13 17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17Z" fill="currentColor"/> <path d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z" fill="currentColor"/> <path d="M8 17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.55228 16 8 16.4477 8 17Z" fill="currentColor"/> <path d="M8 13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13C6 12.4477 6.44772 12 7 12C7.55228 12 8 12.4477 8 13Z" fill="currentColor"/>`);

// Solar Linear — Arrows/Arrow Right Up
export const EXTERNAL = wrap(`<path d="M6 18L18 6M18 6H9M18 6V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);

// Solar Linear — Essentional, UI/Close Circle
export const CLOSE = wrap(`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/> <path d="M14.5 9.49999L9.5 14.5M9.49998 9.49997L14.5 14.4999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`);

// Solar Linear — Essentional, UI/Add Circle
export const PLUS = wrap(`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/> <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`);

// Solar Linear — Essentional, UI/Check Circle
export const CHECK = wrap(`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/> <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);

// Solar Linear — Users/User
export const USER = wrap(`<circle cx="12" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/> <path d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" stroke="currentColor" stroke-width="1.5"/>`);

// Solar Linear — Users/Users Group Rounded
export const USERS = wrap(`<circle cx="9" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/> <path d="M15 9C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/> <ellipse cx="9" cy="17" rx="7" ry="4" stroke="currentColor" stroke-width="1.5"/> <path d="M18 14C19.7542 14.3847 21 15.3589 21 16.5C21 17.5293 19.9863 18.4229 18.5 18.8704" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`);
