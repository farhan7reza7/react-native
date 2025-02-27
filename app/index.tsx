import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Timeout = ReturnType<typeof setTimeout>;
interface WonType {
  win: boolean;
  player: string;
  match: number[];
}
export default function CubesBoard() {
  const timeoutRef = useRef<Timeout | null>(null);

  const [values, setValues] = useState<Array<undefined | string>>(
    Array.from({ length: 9 })
  );
  const [isX, setIsX] = useState(true);
  const [history, setHistory] = useState([values]);
  const [isTimeTravel, setTimeTravel] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [isWon, setIsWon] = useState<boolean | WonType>(false);
  const [isTied, setIsTied] = useState(false);
  const [isBot, setIsBot] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

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
        setIsWon(won);
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

  const handleReset = useCallback(() => {
    setValues(history[0]);
    setHistory([history[0]]);
    setStep(0);
    setTimeTravel(false);
    setIsWon(false);
    setIsTied(false);
    setIsBot(false);
    setIsX(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const cubes = useMemo(
    () =>
      values.map((item, index) => (
        <Cube
          value={item as number | string | undefined}
          key={index}
          onPress={() => handlePress(index)}
          match={
            isWon && (isWon as WonType).match.includes(index)
              ? (isWon as WonType).match
              : undefined
          }
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

  useEffect(() => {
    if (isBot) {
      timeoutRef.current = setTimeout(() => {
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

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      };
    }
  }, [isBot, values]);

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
      {name && (
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          {!isEdit && (
            <Pressable onPress={() => setIsEdit(true)} style={styles.stepBtn}>
              <Text style={styles.stepText}>Edit</Text>
            </Pressable>
          )}
        </View>
      )}
      <View style={styles.cubesBlock}>
        {cubes}
        {(isWon || isTied) && (
          <View style={styles.gameOver}>
            <Text style={styles.gameOverText}>
              {isWon ? `${(isWon as WonType).player} Won!` : "Game Tied!"}
            </Text>
          </View>
        )}
      </View>
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
              onPress={handleReset}
            >
              <Text style={styles.stepText}>Play Again</Text>
            </Pressable>
          )}
        </View>
      </View>

      {isEdit && (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={name}
            placeholder="Write your name"
            onChangeText={setName}
            maxLength={30}
          />
          <Pressable
            onPress={() => {
              if (name.length) setIsEdit(false);
            }}
            style={[
              styles.stepBtn,
              !name.length && { backgroundColor: "lightgray" },
            ]}
            disabled={!name.length}
          >
            <Text style={styles.stepText}>Submit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

type Props = {
  value: number | string | undefined;
  onPress: () => void;
  match: number[] | undefined;
};

const Cube = ({ value, onPress, match }: Props): JSX.Element => (
  <Pressable style={styles.cube} onPress={onPress}>
    <Text style={[styles.cubeText, match && { color: "deeppink" }]}>
      {value}
    </Text>
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
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  name: { color: "green", fontSize: 20, fontWeight: "medium" },
  cubesBlock: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    position: "relative",
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
  cubeText: { fontSize: 24, color: "#000", padding: 5 },
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
    flexDirection: "row",
    gap: 8,
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
  gameOver: {
    position: "absolute",
    top: "25%",
    left: 40,
    right: 40,
    backgroundColor: "deeppink",
    padding: 10,
    alignItems: "center",
  },
  gameOverText: { color: "#fff", fontSize: 24 },
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
    if (a && a === b && b === c) return { win: true, player: a, match: win };
  }
  return false;
}
