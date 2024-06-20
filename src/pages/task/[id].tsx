import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { db } from "@/services/firebaseConnection";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { Textarea } from "@/components/textarea";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";

interface ITaskProps {
  item: {
    tarefa: string;
    isPublic: boolean;
    dataCriacao: string;
    user: string;
    taskId: string;
  };
}

export default function Task({ item }: ITaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");

  async function handleComment(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;
    if (!session?.user?.email || !session.user.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        dataCriacao: new Date(),
        user: session.user.email,
        name: session.user.name,
        taskId: item?.taskId,
      });

      setInput("");
      toast.success("Comentário adicionado!");
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível adicionar comentário!");
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>
        <form onSubmit={handleComment}>
          <Textarea
            placeholder="Deixe seu comentário..."
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
          />
          <button className={styles.button} disabled={!session?.user}>
            Enviar Comentário
          </button>
        </form>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tarefas", id);

  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined || !snapshot.data()?.isPublic) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.dataCriacao.seconds * 1000;

  const task = {
    tarefa: snapshot.data()?.tarefa,
    isPublic: snapshot.data()?.isPublic,
    dataCriacao: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  };

  return {
    props: {
      item: task,
    },
  };
};
