package ast;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/** A display-only view of the parsed program, used to show the syntax tree in the UI. */
public final class TreeNode {

    private final String label;
    private final List<TreeNode> children;

    public TreeNode(String label, TreeNode... children) {
        this(label, Arrays.asList(children));
    }

    public TreeNode(String label, List<TreeNode> children) {
        this.label = label;
        this.children = Collections.unmodifiableList(children);
    }

    public String getLabel()            { return label;    }
    public List<TreeNode> getChildren() { return children; }
}
