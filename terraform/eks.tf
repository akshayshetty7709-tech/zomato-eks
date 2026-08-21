module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.35"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  enable_cluster_creator_admin_permissions = true   # <-- idha add pannunga

  eks_managed_node_groups = {
    zomato_nodes = {
      instance_types = ["c7i-flex.large"]
      min_size       = 1
      max_size       = 3
      desired_size   = 2
    }
  }
}