// project.js - purpose and description here
// Author: Luke Murayama
// Date: 4/7/2024

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

function main() {
  const fillers = {
    greeting: ["Hello my", "To the", "What's good my", "Yo", "Wassup"],
    title: [
      "King",
      "Queen",
      "Lord",
      "Jarl",
      "Duke",
      "Duchess",
      "Prince",
      "Princess",
      "Emperor",
      "Empress",
      "Count",
      "Countess",
      "Baron",
      "Baroness",
      "Earl",
      "Viscount",
      "Bishop",
      "Abbess",
      "Knight",
      "Sir",
      "Dame",
      "Squire",
      "Esquire",
      "Sergeant",
      "Vassal",
      "Nobleman",
      "Noblewoman",
    ],
    adjective: [
      "Lit",
      "Salty",
      "Thirsty",
      "Clutch",
      "Savage",
      "Bougie",
      "Extra",
      "Flex",
      "Fire",
      "Basic",
      "High-key",
      "Low-key",
      "Cringy",
      "Gucci",
      "Swaggy",
    ],
    name: [
      "Aldric",
      "Isolde",
      "Lancelot",
      "Guinevere",
      "Cedric",
      "Eleanor",
      "Gawain",
      "Rowena",
      "Percival",
      "Elowen",
      "Tristan",
      "Genevieve",
      "Gareth",
      "Brienne",
      "Galahad",
      "Aveline",
      "Arthur",
      "Morgana",
      "Rupert",
      "Evangeline",
    ],
    valediction: [
      "Peace out!",
      "Catch you later!",
      "Later gator!",
      "Stay chill!",
      "See ya!",
      "Bye for now!",
      "Take care!",
      "Keep it real!",
      "TTYL",
      "Deuces!",
      "Gotta bounce!",
      "Adios!",
      "Peace and love!",
      "Until next time!",
      "Keep slayin'!",
    ],
    emotion: [
      "reluctant",
      "happy",
      "hyped",
      "shook",
      "triggered",
      "down",
      "just writing",
      "fired up",
    ],
    event: [
      "Coronation",
      "Knighting Ceremony",
      "Royal Wedding",
      "Investiture",
      "Tournament",
      "Grand Hunt",
      "Jousting Tournament",
      "Masquerade Ball",
      "Royal Banquet",
      "State Dinner",
      "Heraldic Ceremony",
      "Grand Procession",
      "Royal Progress",
      "Harvest Festival",
      "Hunting Party",
      "Court Ball",
      "Victory Parade",
      "Council of Nobles",
    ],
    item: [
      "sword",
      "shield",
      "chainmail",
      "helmet",
      "gauntlets",
      "breastplate",
      "lance",
      "longbow",
      "arrows",
      "dagger",
      "mace",
      "warhammer",
      "crossbow",
      "potion",
      "scroll",
    ],
    bad_event: [
      "the plague",
      "the riot",
      "the foreign invasion",
      "the bandits",
      "the revolt",
      "the siege",
      "the war",
    ],
    relation: [
      "I looketh forawrd towards seeing you there.",
      "Mine ear has heard it will be great.",
      "This shall be very interesting.",
      "It will be beyond legendary.",
      "Straight fire.",
    ],
  };
  const template = `$greeting $adjective $title $name!
  
  I am $emotion to telleth thee that I shall be going to the $adjective $event. I haveth heard that thou art also going as well.
  
  $relation
  
  Maketh sure you doth bring you $item.
  
  Watch out for any delays caused by $bad_event.
  
  $valediction 
  $adjective $title $name
  `;
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    $("#box").text(story);
  }
  
  const clickerTexts = [
    "YOLO",
    "It's rewind time",
    "Reroll",
    "Based",
    "Click me",
    "Too Cringe",
    "Another one",
  ];
  
  function clickerText() {
    $("#clicker").text(clickerTexts[Math.floor(Math.random() * clickerTexts.length)]);
  }
  
  function clickFunction() {
    generate();
    clickerText();
  }
  
  /* global clicker */
  $("#clicker").click(clickFunction);
  
  clickFunction();
}
main();