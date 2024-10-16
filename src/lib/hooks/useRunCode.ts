import { FragmentData, FragmentsAtom, RunnedStatus } from "@/components/CodeContent";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { Source } from "../source";
import { SourceType, CompiledContract, DecodeVariableResult } from "../types";
import { EthVM } from "../vm";
import { renderResult } from "../ui_utils";

export const useRunCode = () => {
  return useAtomCallback(
    useCallback(async (get, set, index?: number) => {
      if (index === undefined) return;
      const fragments = get(FragmentsAtom);
      const fragment = fragments[index];
      const setFragment = (index: number, cb: (draft: FragmentData) => void) => {
        set(FragmentsAtom, (draft) => {
          cb(draft[index]);
        });
      }
      // 重建已经运行过的段的souce
      const source = new Source();
      for (let i = 0; i < index; i++) {
        if (fragments[i].runned !== RunnedStatus.Success) continue;
        const detailCode = fragments[i].detailCode!;
        source.addCode(detailCode);
      }

      setFragment(index, (draft) => {
        draft.runned = RunnedStatus.Running;
        draft.result = undefined;
        draft.error = undefined;
      })

      const vm = await EthVM.create();
      try {
        const codes = fragment.code.trim().split("\n");
        const {
          type: type,
          source: newSource,
          variableMeta,
        } = await source.tryCompileNewCode(codes);

        const result = await vm.runCode(
          newSource,
          type === SourceType.VariableDeclaration
        );
        const {variable, value} = type === SourceType.VariableDeclaration ? await newSource.decodeVariable(
          result,
          variableMeta!
        ) : {} as DecodeVariableResult;

        set(FragmentsAtom, (draft) => {
          const fragment = draft[index];
          fragment.result = {variable, value};

          if (!fragment.detailCode) fragment.detailCode = {}
          switch (type) {
            case SourceType.VariableDeclaration:
              fragment.detailCode!.runnableCode = codes.slice(0, -1).join("\n");
              break;
            case SourceType.Normal:
              fragment.detailCode!.runnableCode = fragment.code;
              break;
          }
          draft[index].runned = RunnedStatus.Success;
        });
      } catch (e: unknown) {
        console.log("error", e);
        if ((e as CompiledContract).errors) {
          set(FragmentsAtom, (draft) => {
            draft[index].error = (e as CompiledContract).errors;
            draft[index].runned = RunnedStatus.Error;
          });
        }
      }
    }, [])
  );
};
