import { Source } from "@/lib/source";
import CodeFragment from "./CodeFragment";
import { atom, useAtom, useSetAtom } from "jotai";
import { splitAtom } from "jotai/utils";
import { atomWithImmer } from "jotai-immer";
import { nanoid } from "nanoid";
import { CompileError, DecodeVariableResult } from "@/lib/types";

export type FragmentCodeDetail = {
  runnableCode?: string;
  topLevelCode?: string;
  globalCode?: string;
};
export enum RunnedStatus {
  NotRunned,
  Running,
  Success,
  Error,
}
// 定义一个类型来表示每个代码段的数据
export type FragmentData = {
  uuid: string;
  code: string;
  runned: RunnedStatus;
  detailCode?: FragmentCodeDetail;
  result?: DecodeVariableResult;
  error?: CompileError[];
};

export type FragmentMeta = {
  source: Source;
};

export const FragmentsMeta = new Map<string, FragmentMeta>();

export const FragmentsAtom = atomWithImmer<FragmentData[]>([
  {
    uuid: nanoid(),
    code: "uint x = 10;\nx",
    runned: RunnedStatus.NotRunned,
  },
  {
    uuid: nanoid(),
    code: "uint y = x + 10;",
    runned: RunnedStatus.NotRunned,
  },
  {
    uuid: nanoid(),
    code: "address(0).balance",
    runned: RunnedStatus.NotRunned,
  },
]);
FragmentsAtom.debugLabel = "FragmentsAtom";

export const FragmentAtomsAtom = splitAtom(FragmentsAtom);
FragmentAtomsAtom.debugLabel = "FragmentAtomsAtom";

export const AddFragment = atom(null, (_, set, index?: number) => {
  const newFragment = {
    uuid: nanoid(),
    code: "",
    runned: RunnedStatus.NotRunned,
  };
  set(FragmentsAtom, (draft) => {
    if (index === undefined) {
      index = draft.length;
    }
    draft.splice(index, 0, newFragment);
  });
});

export const MoveFragment = atom(
  null,
  (_, set, fromIndex: number, toIndex: number) => {
    set(FragmentsAtom, (draft) => {
      const [movedFragment] = draft.splice(fromIndex, 1);
      draft.splice(toIndex, 0, movedFragment);
    });
  }
);

export default function CodeContent() {
  const [fragmentAtoms] = useAtom(FragmentAtomsAtom);
  const addFragment = useSetAtom(AddFragment);

  return (
    <div className="flex-grow p-4">
      {fragmentAtoms.map((fragmentAtom, index) => (
        <CodeFragment
          className="mb-2"
          key={fragmentAtom.toString()}
          fragmentAtom={fragmentAtom}
          index={index}
        />
      ))}
      <div className="relative w-full h-8">
        <button
          className="absolute inset-0 w-full h-full hover:border hover:border-gray-300 hover:shadow-inner opacity-0 hover:opacity-100 transition-opacity duration-100 text-gray-500 text-sm text-center"
          onClick={() => addFragment()}
        >
          添加代码段
        </button>
      </div>
    </div>
  );
}
