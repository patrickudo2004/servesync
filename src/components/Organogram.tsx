import React from 'react';
import { RoleBadge, UserRole } from './RoleBadge';
import styles from './Organogram.module.css';
import { ChevronDown, ChevronRight, User } from 'lucide-react';

export interface OrgNode {
  id: string;
  name: string;
  role: UserRole;
  children?: OrgNode[];
}

interface OrganogramProps {
  data: OrgNode;
}

const TreeNode: React.FC<{ node: OrgNode; depth: number }> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={styles.nodeWrapper} style={{ marginLeft: depth > 0 ? '2rem' : 0 }}>
      <div className={styles.node}>
        <div className={styles.nodeContent}>
          <div className={styles.avatar}>
            <User size={16} />
          </div>
          <div className={styles.info}>
            <p className={styles.name}>{node.name}</p>
            <RoleBadge role={node.role} className={styles.badge} />
          </div>
          {hasChildren && (
            <button 
              className={styles.toggle} 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className={styles.children}>
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Organogram: React.FC<OrganogramProps> = ({ data }) => {
  return (
    <div className={styles.container}>
      <TreeNode node={data} depth={0} />
    </div>
  );
};
