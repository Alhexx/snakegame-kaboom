import kaboom from "kaboom";

kaboom({
  background: [0, 0, 0, 1],
});

const API_URL = "http://localhost:8080";

const gameEvents = new EventSource("http://localhost:8080/game/events");

gameEvents.addEventListener("newState", (e) => {
  const state = JSON.parse(e.data);
  updateGameScene(state);
});

const block_size = 20;

function createBoard(height, width) {
  const board = [];

  // Create top wall
  const topWall = "=".repeat(width + 2);
  board.push(topWall);

  // Create middle rows with side walls
  for (let row = 1; row < height + 1; row++) {
    let rowString = "=";
    for (let col = 1; col < width + 1; col++) {
      rowString += " ";
    }
    rowString += "=";
    board.push(rowString);
  }

  // Create bottom wall
  const bottomWall = "=".repeat(width + 2);
  board.push(bottomWall);

  return board;
}

scene("main", () => {
  const map = addLevel(createBoard(40, 40), {
    width: block_size,
    height: block_size,
    pos: vec2(0, 0),
    "=": () => [rect(block_size, block_size), color(255, 0, 0), area(), "wall"],
  });
});

scene("teste", () => {
  let curSize = 48;
  const pad = 24;

  const nameText = add([
    text("Enter your name:", {
      width: width() - pad * 2,
      size: curSize,
      align: "center",
      lineSpacing: 8,
      letterSpacing: 1,
    }),
    pos(width() / 2, height() / 2 - 50),
    origin("center"),
  ]);

  const input = add([
    pos(width() / 2, height() / 2),
    origin("center"),
    text([], {
      width: width() - pad * 2,
      size: curSize,
      align: "center",
      lineSpacing: 8,
      letterSpacing: 1,
    }),
  ]);

  // Like onKeyPressRepeat() but more suitable for text input.
  onCharInput((ch) => {
    input.text += ch;
  });

  // Like onKeyPress() but will retrigger when key is being held (which is similar to text input behavior)
  // Insert new line when user presses enter
  onKeyPressRepeat("enter", () => {
    postData(input.text)
      .then((response) => {
        console.log("API response:", response);
        go("main");
        // Handle the API response here
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle the error here
      });
  });

  // Delete last character
  onKeyPressRepeat("backspace", () => {
    input.text = input.text.substring(0, input.text.length - 1);
  });

  async function postData(name) {
    const response = await fetch(API_URL + "/game/snakes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send data to the API.");
    }

    return response.json();
  }
});

go("teste");
