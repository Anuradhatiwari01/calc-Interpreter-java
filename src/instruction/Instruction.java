package instruction;
import ast.TreeNode;
import environment.Environment;

import java.util.ArrayList;
import java.util.List;

public interface Instruction {
    void execute(Environment env);

    TreeNode toTree();

    static List<TreeNode> toTrees(List<Instruction> instructions) {
        List<TreeNode> trees = new ArrayList<>();
        for (Instruction instruction : instructions) {
            trees.add(instruction.toTree());
        }
        return trees;
    }
}
