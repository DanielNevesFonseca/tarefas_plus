import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Textarea } from "@/components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { db } from "@/services/firebaseConnection";
import {
  doc,
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Link from "next/link";

interface IDashProps {
  user: {
    email: string;
  };
}

interface ITaskProps {
  id: string;
  dataCriacao: Date;
  isPublic: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: IDashProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<ITaskProps[]>([]);

  useEffect(() => {
    async function loadTarefas() {
      const tarefasRef = collection(db, "tarefas");
      const myQuery = query(
        tarefasRef,
        orderBy("dataCriacao", "desc"),
        where("user", "==", user.email)
      );

      onSnapshot(myQuery, (snapshot) => {
        let taskList: ITaskProps[] = [];

        snapshot.forEach((doc) => {
          taskList.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            dataCriacao: doc.data().dataCriacao,
            user: doc.data().user,
            isPublic: doc.data().isPublic,
          });
        });

        setTasks(taskList);
      });
    }
    loadTarefas();
    console.log(tasks);
  }, []);

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked);
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/tasks/${id}`
    );
    toast.info("URL copiada para área de transferência!");
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();

    if (input === "") return alert("Digite algo no campo de tarefas.");

    try {
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        dataCriacao: new Date(),
        user: user?.email,
        isPublic: publicTask,
      });

      setInput("");
      setPublicTask(false);
      toast.success("Tarefa adicionada com sucesso!");
    } catch (error) {
      console.log(error);
      toast.error("Ocorreu algum erro!");
    }
  }

  async function handleDeleteTask(id: string) {
    const docRef = doc(db, "tarefas", id);
    console.log("id ===> ", id);
    await deleteDoc(docRef);
    toast.success("Tarefa deletada!");
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Digite sua tarefa..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setInput(e.target.value);
                }}
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa pública?</label>
              </div>

              <button type="submit" className={styles.button}>
                Registrar
              </button>
            </form>
          </div>
        </section>
      </main>

      <section className={styles.taskContainer}>
        <h1>Minhas tarefas</h1>

        {tasks.map((task) => (
          <article key={task.id} className={styles.task}>
            {task.isPublic && (
              <div className={styles.tagContainer}>
                <label className={styles.tag}>PÚBLICO</label>
                <button
                  className={styles.shareButton}
                  onClick={() => handleShare(task.id)}
                >
                  <FiShare2 size={22} color="#3283ff" />
                </button>
              </div>
            )}

            <div className={styles.taskContent}>
              {task.isPublic ? (
                <Link href={`/task/${task.id}`}>
                  <p>{task.tarefa}</p>
                </Link>
              ) : (
                <p>{task.tarefa}</p>
              )}

              <button
                className={styles.trashButton}
                onClick={() => handleDeleteTask(task.id)}
              >
                <FaTrash size={24} color="#ea3140" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  // console.log("Buscando no lado do servidor");
  const currentSession = await getSession({ req });

  if (!currentSession?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        email: currentSession.user.email,
      },
    },
  };
};
