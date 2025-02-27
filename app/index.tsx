import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function CubesBoard() {
  const [values, setValues] = useState<Array<undefined | string>>(
    Array.from({ length: 9 })
  );
  const [isX, setIsX] = useState(true);
  const [history, setHistory] = useState([values]);
  const [isTimeTravel, setTimeTravel] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [isWon, setIsWon] = useState(false);
  const [isTied, setIsTied] = useState(false);
  const [isBot, setIsBot] = useState(false);

  const handlePress = useCallback(
    (index: number) => {
      if (values[index] || isWon || isTied) return;
      const copy = values.slice();
      const player = isX ? "X" : "Y";
      copy[index] = player;
      setValues(copy);
      setStep((v) => v + 1);

      const won = winnerDecider(copy);
      if (won) {
        setIsWon(true);
        return;
      }

      if (step >= 8) {
        setIsTied(true);
        return;
      }

      if (isTimeTravel) {
        setHistory((v) => [...v.slice(0, step), copy]);
        setTimeTravel(false);
      } else {
        setHistory((v) => [...v, copy]);
      }
      setIsBot(isX);
      setIsX((v) => !v);
    },
    [values, isX, isTimeTravel, step, isWon, isTied]
  );

  useEffect(() => {
    if (isBot) {
      setTimeout(() => {
        const leftArr: number[] = [];
        const vals = values.filter((val, index) => {
          if (val === undefined) {
            leftArr.push(index);
            return true;
          }
          return false;
        });
        if (!leftArr.length) return;
        handlePress(leftArr[Math.floor(Math.random() * (leftArr.length - 1))]);
        setIsBot(false);
      }, 1000);
    }
  }, [isBot, values]);

  const cubes = useMemo(
    () =>
      values.map((item, index) => (
        <Cube
          value={item as number | string | undefined}
          key={index}
          onPress={() => handlePress(index)}
        />
      )),
    [values]
  );

  const steps = useMemo(
    () =>
      history.map((item, index) => (
        <Pressable
          key={index}
          disabled={history.length === 1 ? true : false}
          style={({ pressed, hovered }) => [
            styles.stepBtn,
            { backgroundColor: history.length === 1 ? "lightgray" : "blue" },
            pressed && styles.pressed,
            hovered && styles.hovered,
          ]}
          onPress={() => {
            setValues(history[index]);
            setStep(index + 1);
            setTimeTravel(true);
          }}
        >
          <Text style={styles.stepText}>
            {index === 0 ? "Go to Start" : `Go to Step ${index}`}
          </Text>
        </Pressable>
      )),
    [history]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.cubesHeader}>
        {!isWon && !isTied
          ? "Current Player: "
          : isWon
          ? "Won By: "
          : "Game Tied By: "}
        <Text style={styles.cubesHeaderSpan}>{isX ? "X" : "Y"}</Text>
      </Text>
      {name && <Text style={styles.name}>{name}</Text>}
      <View style={styles.cubesBlock}>{cubes}</View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Time Travel</Text>
        <View style={styles.steps}>
          {!isTied && !isWon ? (
            steps
          ) : (
            <Pressable
              style={({ pressed, hovered }) => [
                styles.stepBtn,
                pressed && styles.pressed,
                hovered && styles.hovered,
              ]}
              onPress={() => {
                setValues(history[0]);
                setHistory([history[0]]);
                setStep(0);
                setTimeTravel(false);
                setIsWon(false);
                setIsTied(false);
              }}
            >
              <Text style={styles.stepText}>Play Again</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={name}
          placeholder="Write your name"
          onChangeText={setName}
        />
      </View>
    </View>
  );
}

type Props = {
  value: number | string | undefined;
  onPress: () => void;
};

const Cube = ({ value, onPress }: Props): JSX.Element => (
  <Pressable style={styles.cube} onPress={onPress}>
    <Text style={styles.cubeText}>{value}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    gap: 16,
    paddingVertical: 40,
  },
  cubesHeader: { color: "#000", fontSize: 18 },
  cubesHeaderSpan: { color: "green", fontSize: 24, fontWeight: "bold" },
  name: { color: "green", fontSize: 20, fontWeight: "medium" },
  cubesBlock: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cube: {
    width: 100,
    padding: 10,
    height: 100,
    backgroundColor: "white",
    borderColor: "#000",
    borderWidth: 1,
    justifyContent: "center",
    lineHeight: 100,
    alignItems: "center",
    marginRight: -1,
    marginTop: -1,
  },
  cubeText: { fontSize: 24, color: "#000" },
  footer: {
    gap: 8,
    alignItems: "center",
    backgroundColor: "alice",
    padding: 5,
    borderRadius: 10,
    maxWidth: "75%",
  },
  footerText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  steps: {
    flexDirection: "row",
    gap: 4,
    shadowColor: "lightgray",
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 5,
    padding: 10,
    width: "100%",
    flexWrap: "wrap",
  },
  stepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "blue",
    borderRadius: 15,
  },
  pressed: {
    backgroundColor: "darkblue",
    borderColor: "#000",
    borderWidth: 1,
  },
  hovered: { backgroundColor: "violet" },
  stepText: { color: "#fff", fontSize: 14 },
  inputWrapper: {
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "lightgray",
    shadowOpacity: 0.7,
    shadowOffset: { width: 1, height: 1 },
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 18,
  },
});

function winnerDecider(values: (string | undefined)[]) {
  const wonOptions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const win of wonOptions) {
    const a = values[win[0]];
    const b = values[win[1]];
    const c = values[win[2]];
    if (a && a === b && b === c) return { win: true, player: a };
  }
  return false;
}
