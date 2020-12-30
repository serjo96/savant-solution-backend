export default function (): string {
  return `${getRandomInitInString().substr(
    0,
    3,
  )}-${getRandomInitInString().substr(0, 7)}-${getRandomInitInString().substr(
    0,
    7,
  )}`;
}

function getRandomInitInString() {
  return `${Math.floor(Math.random() * Date.now())}`;
}
